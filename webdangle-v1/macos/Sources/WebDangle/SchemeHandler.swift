import WebKit

/// Serves the charm engine to the web view over a custom scheme.
///
/// Why not just `loadFileURL`? Because the engine is built from ES modules, and
/// WebKit gives `file://` pages a null origin, so `import` fails CORS and the whole
/// charm never boots. A custom scheme handler gives the page a real, stable origin
/// and lets us set correct MIME types, which is exactly what modules need.
final class ResourceSchemeHandler: NSObject, WKURLSchemeHandler {
    static let scheme = "webdangle-charm"

    private let root: URL

    init(root: URL) {
        self.root = root.standardizedFileURL
        super.init()
    }

    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url else {
            task.didFailWithError(URLError(.badURL))
            return
        }

        var relative = url.path
        if relative.isEmpty || relative == "/" { relative = "/charm.html" }

        // Never serve anything outside the bundled web directory.
        let candidate = root.appendingPathComponent(relative).standardizedFileURL
        guard candidate.path.hasPrefix(root.path) else {
            respond(task, url: url, status: 403, mime: "text/plain", data: Data("forbidden".utf8))
            return
        }

        guard let data = try? Data(contentsOf: candidate) else {
            respond(task, url: url, status: 404, mime: "text/plain", data: Data("not found".utf8))
            return
        }

        respond(task, url: url, status: 200, mime: Self.mime(for: candidate.pathExtension), data: data)
    }

    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {
        // Nothing streams, so there is nothing to cancel.
    }

    private func respond(_ task: WKURLSchemeTask, url: URL, status: Int, mime: String, data: Data) {
        let response = HTTPURLResponse(
            url: url,
            statusCode: status,
            httpVersion: "HTTP/1.1",
            headerFields: [
                "Content-Type": mime,
                "Content-Length": String(data.count),
                "Cache-Control": "no-store",
                // The page and its modules share this origin, but be explicit.
                "Access-Control-Allow-Origin": "*",
            ]
        )
        guard let response else {
            task.didFailWithError(URLError(.cannotParseResponse))
            return
        }
        task.didReceive(response)
        task.didReceive(data)
        task.didFinish()
    }

    private static func mime(for ext: String) -> String {
        switch ext.lowercased() {
        case "html", "htm": return "text/html; charset=utf-8"
        case "js", "mjs": return "text/javascript; charset=utf-8"
        case "css": return "text/css; charset=utf-8"
        case "json": return "application/json; charset=utf-8"
        case "svg": return "image/svg+xml"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "webp": return "image/webp"
        case "gif": return "image/gif"
        case "woff2": return "font/woff2"
        case "ico": return "image/x-icon"
        default: return "application/octet-stream"
        }
    }
}

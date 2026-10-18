import Carbon.HIToolbox
import AppKit

/// Global hotkeys without an Accessibility prompt.
///
/// The obvious approach — `NSEvent.addGlobalMonitorForEvents(matching: .keyDown)` —
/// needs the user to grant Accessibility permission, which greets a first launch
/// with a scary system dialog for what is, ultimately, a lucky charm. Carbon's
/// `RegisterEventHotKey` predates all of that, still works, and asks for nothing.
final class HotKeyCenter {
    static let shared = HotKeyCenter()

    private var handlers: [UInt32: () -> Void] = [:]
    private var refs: [EventHotKeyRef] = []
    private var nextID: UInt32 = 1
    private var installed = false

    private init() {}

    @discardableResult
    func register(keyCode: UInt32, modifiers: UInt32, handler: @escaping () -> Void) -> Bool {
        installHandlerIfNeeded()

        let id = nextID
        nextID += 1

        let hotKeyID = EventHotKeyID(signature: OSType(0x57444E47), id: id) // 'WDNG'
        var ref: EventHotKeyRef?
        let status = RegisterEventHotKey(keyCode, modifiers, hotKeyID, GetApplicationEventTarget(), 0, &ref)

        guard status == noErr, let ref else {
            NSLog("[WebDangle] hotkey registration failed for keyCode \(keyCode) (status \(status))")
            return false
        }

        handlers[id] = handler
        refs.append(ref)
        return true
    }

    fileprivate func fire(id: UInt32) {
        handlers[id]?()
    }

    private func installHandlerIfNeeded() {
        guard !installed else { return }
        installed = true

        var eventType = EventTypeSpec(
            eventClass: OSType(kEventClassKeyboard),
            eventKind: UInt32(kEventHotKeyPressed)
        )

        InstallEventHandler(
            GetApplicationEventTarget(),
            { _, event, _ -> OSStatus in
                guard let event else { return OSStatus(eventNotHandledErr) }
                var hotKeyID = EventHotKeyID()
                let err = GetEventParameter(
                    event,
                    EventParamName(kEventParamDirectObject),
                    EventParamType(typeEventHotKeyID),
                    nil,
                    MemoryLayout<EventHotKeyID>.size,
                    nil,
                    &hotKeyID
                )
                if err == noErr {
                    HotKeyCenter.shared.fire(id: hotKeyID.id)
                }
                return noErr
            },
            1,
            &eventType,
            nil,
            nil
        )
    }
}

/// The two shortcuts the product promises, plus optional anchor nudging.
enum Shortcuts {
    static func install(onToggle: @escaping () -> Void, onRitual: @escaping () -> Void) {
        let control = UInt32(controlKey)
        // kVK_ANSI_D = 2, kVK_ANSI_S = 1
        HotKeyCenter.shared.register(keyCode: UInt32(kVK_ANSI_D), modifiers: control, handler: onToggle)
        HotKeyCenter.shared.register(keyCode: UInt32(kVK_ANSI_S), modifiers: control, handler: onRitual)
    }
}

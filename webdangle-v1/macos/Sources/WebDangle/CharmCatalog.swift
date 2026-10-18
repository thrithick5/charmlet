import Foundation

/// A mirror of `web/js/charms.js`, used only to build the menu before the web view
/// has booted. Once the page is live the menu is rebuilt from the engine itself, so
/// the JavaScript stays the single source of truth and a new charm shows up in the
/// menu without touching Swift.
struct Charm: Equatable {
    let id: String
    let name: String
    let ritual: String
}

enum CharmCatalog {
    /// Fallback list. Kept in the same order as CHARMS in charms.js.
    static let fallback: [Charm] = [
        Charm(id: "slinger", name: "Web Slinger", ritual: "Thwip"),
        Charm(id: "boba", name: "Boba", ritual: "Slurp"),
        Charm(id: "capybara", name: "Capybara", ritual: "Chill"),
        Charm(id: "disco", name: "Disco ball", ritual: "Spin it"),
        Charm(id: "tamagotchi", name: "Pixel pet", ritual: "Feed it"),
        Charm(id: "esc", name: "ESC key", ritual: "Press it"),
        Charm(id: "slime", name: "Slime", ritual: "Squish"),
        Charm(id: "aura", name: "Aura orb", ritual: "Absorb"),
        Charm(id: "nazar", name: "Nazar boncuğu", ritual: "Flick it"),
        Charm(id: "hamsa", name: "Hamsa", ritual: "Flick it"),
        Charm(id: "daruma", name: "Daruma", ritual: "Make a wish"),
        Charm(id: "maneki", name: "Maneki-neko", ritual: "Beckon"),
        Charm(id: "drishti", name: "Drishti bommai", ritual: "Repaint it"),
        Charm(id: "scarab", name: "Scarab", ritual: "Spread wings"),
        Charm(id: "horseshoe", name: "Horseshoe", ritual: "Flick it"),
        Charm(id: "himmeli", name: "Himmeli", ritual: "Set it turning"),
        Charm(id: "ghanta", name: "Ghanta", ritual: "Ring it"),
        Charm(id: "panchang", name: "Páncháng jié", ritual: "Cinch it"),
    ]

    static func name(for id: String) -> String {
        fallback.first { $0.id == id }?.name ?? id
    }
}

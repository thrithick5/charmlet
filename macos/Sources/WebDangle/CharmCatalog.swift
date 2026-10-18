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
    /// Fallback list. Kept in the same order as CHARMS in charms.js — Book My
    /// Luck's lineup. The menu is rebuilt from the engine once the page boots, so
    /// this only matters for the first menu build.
    static let fallback: [Charm] = [
        Charm(id: "nazar", name: "Nazar boncuğu", ritual: "Give it a flick"),
        Charm(id: "murugar", name: "Murugar", ritual: "Raise the vel"),
        Charm(id: "karuppu", name: "Karuppu", ritual: "Give it a gentle sway"),
        Charm(id: "nimbu", name: "Nimbu-mirchi", ritual: "Hang a fresh garland"),
        Charm(id: "drishti", name: "Drishti bommai", ritual: "Repaint the guardian"),
        Charm(id: "om", name: "Om", ritual: "Let it glow"),
        Charm(id: "ghanta", name: "Ghanta", ritual: "Ring the bell"),
        Charm(id: "peacock", name: "Peacock", ritual: "Fan the feathers"),
        Charm(id: "elephant", name: "Elephant", ritual: "Give it a flick"),
        Charm(id: "hamsa", name: "Hamsa", ritual: "Give it a flick"),
        Charm(id: "panchang", name: "Páncháng jié", ritual: "Tie in good fortune"),
        Charm(id: "horseshoe", name: "Horseshoe", ritual: "Give it a flick"),
        Charm(id: "clover", name: "Four-leaf clover", ritual: "Give it a flick"),
        Charm(id: "maneki", name: "Maneki-neko", ritual: "Beckon good fortune"),
        Charm(id: "daruma", name: "Daruma", ritual: "Make a wish"),
        Charm(id: "scarab", name: "Scarab", ritual: "Catch the light"),
        Charm(id: "ladybug", name: "Ladybug", ritual: "Give it a flick"),
        Charm(id: "dreamcatcher", name: "Dreamcatcher", ritual: "Give it a flick"),
        Charm(id: "bamboo", name: "Lucky bamboo", ritual: "Give it a flick"),
        Charm(id: "himmeli", name: "Himmeli", ritual: "Set it turning"),
    ]

    static func name(for id: String) -> String {
        fallback.first { $0.id == id }?.name ?? id
    }
}

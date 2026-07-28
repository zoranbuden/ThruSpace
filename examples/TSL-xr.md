# TSL XR Example

An XR-oriented example showing spatial reasoning for virtual environments.

object Floor {
    mode: CART
    interval: [0, 0.2]
}

object Avatar {
    mode: SPHERE
    interval: [0.2, 1.8]
    contact: Floor
}

object Portal {
    mode: POLAR
    interval: [1.8, 3]
}

layout {
    Avatar near Portal
    Portal above Floor
}

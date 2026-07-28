# TSL Basic Example

This example demonstrates a simple declarative spatial layout using TSL.

object CubeA {
    mode: CART
    interval: [0, 1]
}

object SphereA {
    mode: SPHERE
    interval: [1, 2]
    contact: CubeA
}

layout {
    CubeA above SphereA
}

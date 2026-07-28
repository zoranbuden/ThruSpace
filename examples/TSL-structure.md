# TSL Structural Layout Example

A multi-object structural layout using modal consistency.

object Base {
    mode: CART
    interval: [0, 1]
}

object Column {
    mode: POLAR
    interval: [1, 3]
    contact: Base
}

object Dome {
    mode: SPHERE
    interval: [3, 4]
    contact: Column
}

layout {
    Base supports Column
    Column supports Dome
}

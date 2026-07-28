# TSL Contact-Point Example

This example shows how contact-point semantics define structural interaction.

object Plate {
    mode: CART
    interval: [0, 0.5]
}

object Cylinder {
    mode: POLAR
    interval: [0.5, 1.5]
    contact: Plate
}

contact-point {
    Cylinder.bottom touches Plate.top
}

# TSL Interval Reasoning Example

This example demonstrates interval-based spatial transitions.

object NodeA {
    mode: CART
    interval: [0, 1]
}

object NodeB {
    mode: CART
    interval: [1, 2]
}

transition {
    NodeA -> NodeB
    type: interval-shift
}

# TSL — ThruSpace Layout Language

TSL is a declarative spatial layout language for XR/AI systems.

## Core Principles
- Declarative geometry
- Constraint-based layout
- Modal consistency (CART / POLAR / SPHERE)
- Structural validation

## Purpose
TSL allows XR/AI systems to define spatial structures using high-level declarative rules.

## Example

object Cube {
    mode: CART
    interval: [0, 1]
    contact: SphereA
}

object SphereA {
    mode: SPHERE
    interval: [1, 2]
}

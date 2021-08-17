# Next steps ideas

Instead of animating version, generate a (mostly?) static scene
Make each object have a "gradient" direction it prefers to generate new stuff either alongside or orthogonal to
Gradient direction/rotation/distance can be mutated stochastically as well
Static, balanced set of mutations? Might avoid "boring" patterns by letting the stochasticity control everything
<!-- Get rid of lightness and just use color? -->
Option to hide/show gradient skeleton
Segment properties into "regions" instead of using entire clamped range as markov
When generating new thing along/orthogonal to gradient, should remember which "slots" have already been used

# New idea for simpler generation

You start with one attribute, which only has one of say 8 possible values, and the next value it lands on decides the next attribute you mutate, then just repeat the process

Also incorporate the process of generating a structure w/ gradient

Attributes:
x/y rotation speed
x/y/overall scale
hue

As for gradient:
When generating new thing, it either goes along gradient or orthogonal to gradient
the next attribute to mutate can be gradient pitch or yaw
Only place new object if it wouldn't be too close to another one (use nearby library?)

# GUI

Four panes, each with two buttons: "generate new example" and "pick this stochastic model" (or better names)
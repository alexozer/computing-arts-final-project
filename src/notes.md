# Next steps ideas

Instead of animating version, generate a (mostly?) static scene
Make each object have a "gradient" direction it prefers to generate new stuff either alongside or orthogonal to
Gradient direction/rotation/distance can be mutated stochastically as well
Static, balanced set of mutations? Might avoid "boring" patterns by letting the stochasticity control everything
Get rid of lightness and just use color?
Option to hide/show gradient skeleton
Segment properties into "regions" instead of using entire clamped range as markov
When generating new thing along/orthogonal to gradient, should remember which "slots" have already been used

# GUI

Four panes, each with two buttons: "generate new example" and "pick this stochastic model" (or better names)
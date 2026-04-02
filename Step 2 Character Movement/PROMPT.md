# Project: Screen Buddy Chrome Extension

## Vision
There is now a small pig who appears at the top left of my screen. When I open my developer tools console I can see a message that states:
"Buddy chooses new target 485.8123968308396 559.9418377467277 dist 537.9616160304859 attempts 1
content.js:63 Random target generated within bounds: 100 524 797
content.js:85 Buddy chooses new target 200.3896305637309 771.835762839092 dist 355.4788193333283 attempts 1
content.js:63 Random target generated within bounds: 100 524 797
content.js:85 Buddy chooses new target 408.7575973258162 639.3726090712264 dist 246.9082758408367 attempts 1"

This implementation step I want to actually have the character moving around on the screen. But I do not want the movements to be random. I want the character to move from one location to another location in a slow linear motion, then pause at the location for a little bit, then select another direction to move in. The target to destination location between movements should not be very large, it should be about a one or two second lesurely travel. 

As the character moves, the character should face either left or right based on he direction that the character is heading. For example, if the character is moving up by 5 units and to the right by 1 unit, the vertical direction should not be considered in the direction which the character is facing, the character should keep flat horizontally and only change the to face the right direction. 


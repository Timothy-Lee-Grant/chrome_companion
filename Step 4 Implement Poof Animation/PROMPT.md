# Project: Screen Buddy Chrome Extension


I now want to implement a poof feature. I created a png file which I have now put inside of my assets/sprites folder under the name Poof_Animation.png

Informaion about the Poof_Animation.png:

timothy@timothy-System-Product-Name:~/Desktop/Personal_Practice_Projects/chrome_companion/assets/sprites$ identify Poof_Animation.png 
Poof_Animation.png PNG 128x128 128x128+0+0 8-bit sRGB 1659B 0.000u 0:00.000

This animation has four frames along the horizontal axis, and four frames along the vertical axis. Where (x,y) are x: the horizontal axis starting at 0 being the top of the image and going down as x increases. y: the vertical axis starting at 0 being the left side of the image and going right as y increases.
Frame 1 at coordinate (0,0)
Frame 2 at coordinate (1,0)
Frame 3 at coordinate (2,0)
Frame 4 at coordinate (3,0)
Frame 5 at coordinate (0,1)
....
Frame 13 at coordinate (3,0)

I want to implement the functionality that as the user will click on the character, this poof animation will trigger as a cloud which covers the character. The idea will be that the cloud starts building over the character before the character teleports to the corner of the screen. After being clicked, the character will remain in place while the poof starts to build, then at frame 6 (which correspods to the poof cloud being at its largest), the character will teleport to the other location. Then the rest of the poof animation will continue to play as the clould gets smaller and eventually reaches the final frame of frame 13.

This animation should only play when the character is clicked while exploring. If the character is in the corner "sleeping" and the user clicks on it to allow it to start exploring the page, this functionality should not be changed and there should be no poof animation. Only when the character is in the exploration stage and the user clicks should this poof animation be done.
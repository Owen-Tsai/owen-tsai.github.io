import gsap from 'gsap'
import SplitText from 'gsap/SplitText'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Flip from 'gsap/Flip'

// Register GSAP plugins once at application boot time.
gsap.registerPlugin(SplitText, ScrollTrigger, Flip)

export { gsap, SplitText, ScrollTrigger, Flip }

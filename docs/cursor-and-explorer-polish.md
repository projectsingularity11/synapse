# Cursor, ambient light, navigation, and Explorer

The ambient gradients retain their luminance and now respond to pointer position through smoothed CSS translation variables. The existing slow transform animation remains independent. Reduced motion clears pointer translation and stops the animation. A production-browser check confirmed different computed translations after pointer movement and zero retained translation under reduced motion.

The cursor uses an orange 12px ring, a small orange point, a much smaller fluid splat radius, and 24×18px fallback ripples with a 650ms lifetime. Its saturation and visibility are separate from background lighting. Pointer interactions do not add React renders.

The header uses capitalized Synapse branding and an original interlocking signal mark, also used by the favicon. Navigation has a distinct clipped-corner frame, active-page surfaces, and consistent responsive controls. Shared page headings use El Messiri. Shared controls and reading surfaces follow the black, white, and restrained orange palette.

Explorer has framed replay panels, a clearer selector/reset bar, uniform disclosure and spatial-view surfaces, and descriptive section labels. Saved-data selection, prediction withholding, camera controls, and stabilizer records retain their behavior.

Build and lint pass. Nine targeted browser checks passed: home/Explorer accessibility, mobile menu, responsive layout, exact replay selection, stabilizer inspection, spatial context loss, persistent tracker, and reduced/full motion. These checks do not establish physical-device frame rates.

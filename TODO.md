# Performance follow-ups

## Chief Cam embed

- Test deferred and conditional iframe mounting after the first-party performance changes have been measured.
- Reserve stable camera geometry before mounting the iframe and evaluate native iframe lazy loading.
- Avoid mounting a hidden Chief Cam iframe on the Gondola view.
- Review the 1920×900 poster dimensions and its short cache lifetime with the upstream owner.
- Ask the upstream owner to give the versioned Roboto Slab font a long immutable cache lifetime; it currently uses a one-hour `max-age`. The dashboard's Inter font already uses a one-year immutable cache policy.
- Audit Video.js, jQuery, Bootstrap, duplicate analytics, unused CSS, console errors, cookie warnings, and the non-composited loading-spinner animation in the embed.
- Compare PageSpeed results with and without the iframe to quantify its remaining impact before changing its loading behavior.

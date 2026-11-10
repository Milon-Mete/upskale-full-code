// End of the Bhai Dooj window. Keep in step with FESTIVE_OFFER_END in
// Backend/routes/cohortRoutes.js, which is what actually locks the Rs 199 price.
export const FESTIVE_OFFER_END = new Date('2026-12-31T23:59:59+05:30');

export const isFestiveLive = () => Date.now() <= FESTIVE_OFFER_END.getTime();

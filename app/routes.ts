import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("review/:id/:reqId", "routes/review.tsx", { id: "review-req" }),
    route("review/:id", "routes/review.tsx", { id: "review" }),
    route("add", "routes/addReview.tsx")
] satisfies RouteConfig;

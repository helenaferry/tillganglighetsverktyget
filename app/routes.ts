import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("review/:id", "routes/review.tsx"),
    route("add", "routes/addReview.tsx")
] satisfies RouteConfig;

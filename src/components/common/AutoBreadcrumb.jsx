import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ✅ Add all valid routes here
 * Only these paths will be clickable
 */
const VALID_ROUTES = [
  "/dashboard",
  "/dashboard/campus",
  "/dashboard/campus/create-new",
  "/dashboard/student",
  "/dashboard/staff",
];

const AutoBreadcrumb = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";

  return (
    <nav className="text-sm text-gray-500 mb-4 flex items-center">
      {paths.map((path, index) => {
        const routeTo = "/" + paths.slice(0, index + 1).join("/");
        const isLast = index === paths.length - 1;
        const isValidRoute = VALID_ROUTES.includes(routeTo);

        return (
          <span key={routeTo} className="flex items-center">
            {!isLast && isValidRoute ? (
              <Link
                to={routeTo}
                className="hover:text-black capitalize"
              >
                {path.replace("-", " ")}
              </Link>
            ) : (
              <span
                className={`capitalize ${
                  isLast ? "text-black font-semibold" : "text-gray-400",
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {path.replace("-", " ")}
              </span>
            )}

            {!isLast && <span className="mx-2">›</span>}
          </span>
        );
      })}
    </nav>
  );
};

export default AutoBreadcrumb;

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { checkIsAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    try {
      const res = await checkIsAdmin();
      if (!res.is_admin) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: () => <Outlet />,
});

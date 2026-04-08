export const getDeviceStatus = (status: number) => {
  switch (status) {
    case 1:
      return { label: "ONLINE", color: "badge-success", icon: "🟢" };

    case 2:
      return { label: "SLEEP", color: "badge-warning", icon: "🟡" };

    case 3:
      return { label: "OFFLINE", color: "badge-error", icon: "🔴" };

    case 4:
      return { label: "NOT ACTIVE", color: "badge-neutral", icon: "⚪" };

    default:
      return { label: "UNKNOWN", color: "badge-ghost", icon: "❔" };
  }
};

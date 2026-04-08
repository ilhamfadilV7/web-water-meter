export const deviceTypes = (status: number) => {
  switch (status) {
    case 1:
      return { label: "UDP" };

    case 2:
      return { label: "NB-IOT" };

    case 3:
      return { label: "WIFI" };

    case 5:
      return { label: "LORA" };

    case 6:
      return { label: "2G" };

    case 7:
      return { label: "3G" };

    case 8:
      return { label: "4G" };

    case 10:
      return { label: "5G" };

    default:
      return { label: "UNKNOWN", color: "badge-ghost", icon: "❔" };
  }
};

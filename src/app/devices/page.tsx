"use client";

import { useEffect, useState } from "react";
import { Device } from "@/types/device";
import { getDevices } from "@/services/deviceService";
import dynamic from "next/dynamic";
import { getDeviceStatus } from "@/utils/deviceStatus";
import { deviceTypes } from "@/utils/deviceType";
import { Signal } from "lucide-react";
import { isTokenExpired } from "@/utils/auth";
import { useRouter } from "next/navigation";
import ModalAddDevice from "@/component/modalAddDevice";

import { ChartAreaGradient } from "@/component/chart";
import { adjustMinusOneHour } from "@/utils/date";
import { Settings } from "lucide-react";
import Link from "next/link";

import Image from "next/image";

const DevicePage = () => {
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);

  const MapLeaflet = dynamic(() => import("@/component/MapLeaflet"), {
    ssr: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || isTokenExpired()) {
          localStorage.removeItem("token");
          localStorage.removeItem("token_expire");

          router.push("/");
        }

        const data = await getDevices();
        setDevices(data);
      } catch (e) {
        console.log(e);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <span className="text-2xl text-neutral">Device Menu</span>
        <div className="breadcrumbs text-md">
          <ul>
            <li>
              <a>Home</a>
            </li>
            <li>
              <a>Devices</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex">
        {/* <div></div> */}
        <button
          onClick={() => setOpenModal(true)}
          className="btn btn-outline btn-accent btn-md w-auto">
          ADD +
        </button>
      </div>

      <div className="overflow-visible rounded-box border border-base-content/5 bg-base-100 shadow-sm hover:shadow-lg pb-32">
        <table className="table table-zebra">
          {/* head */}
          <thead className="sticky top-0 bg-gray-200 z-10 font-bold text-base">
            <tr>
              <th></th>
              <th>Name WP</th>
              <th>Serial Number</th>
              <th>Alamat</th>
              <th>Tipe</th>
              <th>Status</th>
              <th>Data</th>
              <th>Picture</th>

              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => {
              const status = getDeviceStatus(device.deviceStatus);
              const dvctype = deviceTypes(device.networkType);

              return (
                <tr
                  key={device.id}
                  className="border-b border-slate-800 hover:bg-slate-200 transition-colors duration-200 cursor-pointer hover:border-l-4 hover:border-blue-500">
                  <th>{index + 1}</th>
                  <td>{device.houseNumber}</td>
                  <td>{device.deviceName}</td>
                  <td>{device.address}</td>
                  <td>{dvctype.label}</td>
                  <td>{status.label}</td>
                  <td>
                    <div>
                      <span>Data terakhir : </span>
                      <span className="font-bold">{device.cValue}</span>
                      <span className="text-xs"> m3</span>
                    </div>
                    <div>
                      <span>Last update : </span>
                      {adjustMinusOneHour(device.lastTime)}
                    </div>
                  </td>
                  <td>
                    {device.recentPicPath?.trim() && (
                      <Image
                        src={device.recentPicPath}
                        alt="device"
                        width={100}
                        height={100}
                      />
                    )}
                  </td>
                  <td>
                    <div className="dropdown dropdown-bottom dropdown-end">
                      <Settings
                        tabIndex={0}
                        className="font-light cursor-pointer text-slate-600"
                      />
                      {/* <button tabIndex={0} className="btn btn-sm btn-ghost">
                      </button> */}

                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-white rounded-box shadow-md border border-slate-200 w-36 p-1 z-50 mt-1">
                        <li>
                          <Link
                            href={"/devices/detail?id=" + device.deviceName}>
                            Detail
                          </Link>
                        </li>
                        <li>
                          <a>Edit</a>
                        </li>
                        <li>
                          <a>Delete</a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* MODAL */}
      <ModalAddDevice isOpen={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
};

export default DevicePage;

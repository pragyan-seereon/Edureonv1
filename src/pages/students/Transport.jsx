// import { PageContainer, PageHeader } from "../../components/page-shell";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "../../components/ui/card";
// import { Badge } from "../../components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../../components/ui/table";
// import { Bus, MapPin, Phone, Route as RouteIcon } from "lucide-react";

// // --- Static demo data (swap for real campus/student-ctx data as needed) ---

// const student = {
//   id: "stu-101",
//   name: "Aarav Sharma",
// };

// const routes = [
//   {
//     id: "RT-01",
//     name: "Route 1 — Sector 12 to School",
//     bus: "OD-05-AB-1234",
//     driver: "Ramesh Yadav",
//     conductor: "Suresh Nayak",
//     status: "Running",
//     stops: 8,
//     eta: "35 min",
//     contact: "+91 98100 11221",
//     stopList: [
//       { name: "Sector 12 Market", time: "6:45 AM" },
//       { name: "Green Park Colony", time: "6:55 AM" },
//       { name: "Civil Lines Crossing", time: "7:05 AM" },
//       { name: "Old Bus Stand", time: "7:15 AM" },
//       { name: "Edureon School Gate", time: "7:35 AM" },
//     ],
//   },
//   {
//     id: "RT-02",
//     name: "Route 2 — Riverside to School",
//     bus: "OD-05-AB-5678",
//     driver: "Manoj Behera",
//     conductor: "—",
//     status: "Delayed",
//     stops: 6,
//     eta: "40 min",
//     contact: "+91 98100 33445",
//     stopList: [
//       { name: "Riverside Colony", time: "6:50 AM" },
//       { name: "Temple Square", time: "7:00 AM" },
//       { name: "New Market Chowk", time: "7:15 AM" },
//       { name: "Edureon School Gate", time: "7:40 AM" },
//     ],
//   },
//   {
//     id: "RT-03",
//     name: "Route 3 — Industrial Area to School",
//     bus: "OD-05-AB-9012",
//     driver: "Bikram Sahoo",
//     conductor: "Ashok Mallik",
//     status: "Running",
//     stops: 5,
//     eta: "25 min",
//     contact: "+91 98100 55667",
//     stopList: [
//       { name: "Industrial Estate Gate 2", time: "7:00 AM" },
//       { name: "Workers Colony", time: "7:08 AM" },
//       { name: "Edureon School Gate", time: "7:25 AM" },
//     ],
//   },
// ];

// const transportRoster = {
//   "RT-01": { students: ["stu-101", "stu-102"] },
//   "RT-02": { students: ["stu-103"] },
//   "RT-03": { students: ["stu-104"] },
// };

// export default function StudentTransport() {
//   const routeId = Object.keys(transportRoster).find(
//     (id) => student?.id && transportRoster[id].students.includes(student.id)
//   );
//   const assigned = routes.find((route) => route.id === routeId) ?? routes[0];

//   return (
//     <PageContainer>
//       <PageHeader
//         eyebrow="Student Portal"
//         title="Bus Routes"
//         description="Your assigned route, stop timings and full campus route directory."
//       />
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
//         <Card className="lg:col-span-2 border-border/60">
//           <CardHeader className="pb-2">
//             <CardTitle className="font-display text-base flex items-center gap-2">
//               <Bus className="h-4 w-4" />
//               Assigned Route
//             </CardTitle>
//             <CardDescription>{assigned.name}</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//               <Mini label="Bus" value={assigned.bus} />
//               <Mini label="Driver" value={assigned.driver} />
//               <Mini label="Conductor" value={assigned.conductor ?? "—"} />
//               <Mini label="Status" value={assigned.status} />
//             </div>
//             <div className="space-y-2">
//               {(assigned.stopList ?? []).map((stop, index) => (
//                 <div
//                   key={`${stop.name}-${index}`}
//                   className="flex items-center gap-3 rounded-md border p-3"
//                 >
//                   <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
//                     {index + 1}
//                   </div>
//                   <div className="flex-1">
//                     <div className="text-sm font-medium">{stop.name}</div>
//                     <div className="text-[11px] text-muted-foreground">
//                       Scheduled pickup · {stop.time}
//                     </div>
//                   </div>
//                   <MapPin className="h-4 w-4 text-muted-foreground" />
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="border-border/60">
//           <CardHeader className="pb-2">
//             <CardTitle className="font-display text-base">Route Contact</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-3 text-sm">
//             <div className="flex items-center gap-2">
//               <Phone className="h-4 w-4 text-primary" />
//               {assigned.contact ?? "+91 98100 11221"}
//             </div>
//             <div className="flex items-center gap-2">
//               <RouteIcon className="h-4 w-4 text-primary" />
//               {assigned.stops} stops · {assigned.eta}
//             </div>
//             <Badge
//               variant={
//                 assigned.status === "Running"
//                   ? "default"
//                   : assigned.status === "Delayed"
//                   ? "destructive"
//                   : "secondary"
//               }
//             >
//               {assigned.status}
//             </Badge>
//           </CardContent>
//         </Card>
//       </div>
//       <Card className="border-border/60">
//         <CardHeader className="pb-2">
//           <CardTitle className="font-display text-base">All Bus Routes</CardTitle>
//           <CardDescription>View-only campus route directory</CardDescription>
//         </CardHeader>
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Route</TableHead>
//                 <TableHead>Bus</TableHead>
//                 <TableHead>Driver</TableHead>
//                 <TableHead>Stops</TableHead>
//                 <TableHead>Status</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {routes.map((route) => (
//                 <TableRow key={route.id}>
//                   <TableCell className="font-medium">
//                     <div>{route.name}</div>
//                     <div className="text-[10px] text-muted-foreground font-mono">
//                       {route.id}
//                     </div>
//                   </TableCell>
//                   <TableCell className="text-xs font-mono">{route.bus}</TableCell>
//                   <TableCell className="text-sm">{route.driver}</TableCell>
//                   <TableCell>{route.stops}</TableCell>
//                   <TableCell>
//                     <Badge variant="outline">{route.status}</Badge>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </PageContainer>
//   );
// }

// function Mini({ label, value }) {
//   return (
//     <div className="rounded-md border p-3">
//       <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
//       <div className="text-sm font-semibold truncate">{value}</div>
//     </div>
//   );
// }


import { PageContainer, PageHeader } from "../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { MapPin, RefreshCw, Fuel, Gauge } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getVecvVehicles, syncVecvLiveData } from "../../api/transport";

// Cache reverse-geocoding results across renders/mounts (module-level, in-memory)
const geocodeCache = new Map();

export default function StudentTransport() {
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);

  const [placeNames, setPlaceNames] = useState({});
  const [resolvingKeys, setResolvingKeys] = useState(new Set());

  // --- Retry countdown for rate-limited GPS sync ---
  useEffect(() => {
    if (!retryAfterSeconds) return undefined;
    const timer = window.setInterval(() => {
      setRetryAfterSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [retryAfterSeconds]);

  // --- Load saved vehicle GPS data (real API: GET /vecv/vehicles) ---
  const loadSavedVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    try {
      const response = await getVecvVehicles();
      const payload = response?.data?.data ?? response?.data ?? {};
      const list = Array.isArray(payload) ? payload : payload.vehicleData ?? payload.vehicles ?? [];
      // Drop placeholder rows the VECV API pads its arrays with (vehicleNo: null)
      setVehicles(list.filter((v) => v && v.vehicleNo));
      setLastSyncedAt(payload.lastSyncedAt ?? payload.last_synced_at ?? null);
    } catch (error) {
      // An empty cache is normal before the first successful VECV sync.
      if (error?.response?.status !== 404) {
        toast.error(error?.response?.data?.message ?? "Unable to load saved vehicle locations");
      }
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    loadSavedVehicles();
  }, [loadSavedVehicles]);

  // --- Reverse-geocode vehicle coordinates into place names ---
  useEffect(() => {
    if (!vehicles.length) return;

    vehicles.forEach((vehicle) => {
      const { latitude, longitude } = vehicle;
      if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) return;
      if (Number(latitude) === 0 && Number(longitude) === 0) return;

      const key = `${Number(latitude).toFixed(5)},${Number(longitude).toFixed(5)}`;

      if (geocodeCache.has(key)) {
        setPlaceNames((prev) => (prev[key] ? prev : { ...prev, [key]: geocodeCache.get(key) }));
        return;
      }
      if (resolvingKeys.has(key)) return;

      setResolvingKeys((prev) => new Set(prev).add(key));

      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
        { headers: { Accept: "application/json" } }
      )
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((data) => {
          const addr = data?.address ?? {};
          const name =
            addr.road ||
            addr.neighbourhood ||
            addr.suburb ||
            addr.village ||
            addr.town ||
            addr.city_district ||
            addr.city ||
            data?.display_name?.split(",").slice(0, 2).join(",").trim() ||
            "Unknown location";

          geocodeCache.set(key, name);
          setPlaceNames((prev) => ({ ...prev, [key]: name }));
        })
        .catch(() => {
          geocodeCache.set(key, null);
          setPlaceNames((prev) => ({ ...prev, [key]: null }));
        })
        .finally(() => {
          setResolvingKeys((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles]);

  // --- Trigger a fresh sync (real API: POST /vecv/live-data) ---
  const syncLiveGps = async () => {
    if (retryAfterSeconds > 0) return;

    setSyncing(true);
    try {
      const response = await syncVecvLiveData();
      const payload = response?.data?.data ?? response?.data ?? {};
      const list = payload.vehicleData ?? [];
      setVehicles(list.filter((v) => v && v.vehicleNo));
      setLastSyncedAt(payload.lastSyncedAt ?? null);
      setRetryAfterSeconds(0);
      toast.success(payload.cached ? "Showing cached vehicle data" : "Live GPS data synced");
    } catch (error) {
      const detail = error?.response?.data?.detail;
      const retryAfter = Number(detail?.retryAfterSeconds ?? 0);

      if (error?.response?.status === 429 && retryAfter > 0) {
        setRetryAfterSeconds(retryAfter);
        toast.error(`${detail.message} Try again in ${retryAfter} seconds.`);
      } else {
        toast.error(detail?.message ?? error?.response?.data?.message ?? "Unable to sync live GPS data");
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Student Portal"
        title="Bus Tracking"
        description="Live and last-known GPS positions for campus buses."
      />

      <Card className="border-border/60">
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0 gap-3">
          <div>
            <CardTitle className="font-display text-base">Live Bus Locations</CardTitle>
            <CardDescription>
              {lastSyncedAt ? `Last synced ${formatDateTime(lastSyncedAt)}` : "Saved positions from VECV"}
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={syncLiveGps} disabled={syncing || retryAfterSeconds > 0}>
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing" : retryAfterSeconds > 0 ? `Try again in ${retryAfterSeconds}s` : "Sync live GPS"}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Chassis No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Fuel</TableHead>
                <TableHead>Odometer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loadingVehicles && vehicles.map((vehicle) => (
                <TableRow key={vehicle.deviceId ?? vehicle.vehicleNo}>
                  <TableCell className="font-mono text-xs">{vehicle.vehicleNo ?? "—"}</TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {vehicle.chassisNo ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        vehicle.deviceStatus === "MOVING"
                          ? "default"
                          : vehicle.deviceStatus === "STOPPED"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {vehicle.deviceStatus ?? "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3 w-3 text-muted-foreground" />
                      {vehicle.vehicleSpeed ?? 0} km/h
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      {resolveLocationLabel(vehicle, placeNames, resolvingKeys)}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="flex items-center gap-1">
                      <Fuel className="h-3 w-3 text-muted-foreground" />
                      {vehicle.fuelLevelInPer !== undefined && vehicle.fuelLevelInPer !== null
                        ? `${vehicle.fuelLevelInPer}%`
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell>{vehicle.odometer ?? "—"}</TableCell>
                </TableRow>
              ))}
              {(loadingVehicles || !vehicles.length) && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    {loadingVehicles
                      ? "Loading saved vehicle locations…"
                      : "No saved GPS data. Sync live GPS to get the latest locations."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function resolveLocationLabel(vehicle, placeNames, resolvingKeys) {
  const { latitude, longitude } = vehicle;
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) return "—";
  if (Number(latitude) === 0 && Number(longitude) === 0) return "—";

  const key = `${Number(latitude).toFixed(5)},${Number(longitude).toFixed(5)}`;
  const resolved = placeNames[key];

  if (resolved) return resolved;
  if (resolvingKeys.has(key)) return "Locating…";
  return `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`;
}

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
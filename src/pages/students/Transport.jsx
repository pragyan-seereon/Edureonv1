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
import {
  MapPin,
  RefreshCw,
  Fuel,
  Gauge,
  Bus,
  Navigation,
  ParkingCircle,
  Route as RouteIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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

  // --- Load saved vehicle GPS data ---
  const loadSavedVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    try {
      const response = await getVecvVehicles();
      const payload = response?.data?.data ?? response?.data ?? {};
      const list = Array.isArray(payload) ? payload : payload.vehicleData ?? payload.vehicles ?? [];
      setVehicles(list.filter((v) => v && v.vehicleNo));
      setLastSyncedAt(payload.lastSyncedAt ?? payload.last_synced_at ?? null);
    } catch (error) {
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

  // --- Derived summary stats from real vehicle data (no hardcoding) ---
  const stats = useMemo(() => {
    const total = vehicles.length;
    const moving = vehicles.filter((v) => v.deviceStatus === "MOVING").length;
    const stopped = vehicles.filter((v) => v.deviceStatus === "STOPPED").length;
    const fuelValues = vehicles
      .map((v) => v.fuelLevelInPer)
      .filter((val) => val !== null && val !== undefined);
    const avgFuel = fuelValues.length
      ? Math.round(fuelValues.reduce((a, b) => a + b, 0) / fuelValues.length)
      : null;
    return { total, moving, stopped, avgFuel };
  }, [vehicles]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Student Portal"
        title="Bus Tracking"
        description="Live and last-known GPS positions for campus buses."
      />

      {/* Summary stat strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Bus className="h-4 w-4" />}
          label="Total Buses"
          value={loadingVehicles ? "—" : stats.total}
          accent="bg-primary/10 text-primary"
        />
        <StatCard
          icon={<Navigation className="h-4 w-4" />}
          label="Moving"
          value={loadingVehicles ? "—" : stats.moving}
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          icon={<ParkingCircle className="h-4 w-4" />}
          label="Stopped"
          value={loadingVehicles ? "—" : stats.stopped}
          accent="bg-slate-500/10 text-slate-600"
        />
        <StatCard
          icon={<Fuel className="h-4 w-4" />}
          label="Avg. Fuel"
          value={loadingVehicles || stats.avgFuel === null ? "—" : `${stats.avgFuel}%`}
          accent="bg-amber-500/10 text-amber-600"
        />
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 flex-row items-center justify-between space-y-0 gap-3 bg-gradient-to-r from-muted/40 to-transparent">
          <div>
            <CardTitle className="font-display text-lg tracking-tight">Live Bus Locations</CardTitle>
            <CardDescription className="mt-1">
              {lastSyncedAt ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Last synced {formatDateTime(lastSyncedAt)}
                </span>
              ) : (
                "Saved positions from VECV"
              )}
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={syncLiveGps}
            disabled={syncing || retryAfterSeconds > 0}
            className="shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing" : retryAfterSeconds > 0 ? `Try again in ${retryAfterSeconds}s` : "Sync live GPS"}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60">
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Route</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Vehicle</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Model</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Engine No.</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Chassis No.</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Speed</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Location</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Fuel</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Odometer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loadingVehicles && vehicles.map((vehicle) => {
                const isMoving = vehicle.deviceStatus === "MOVING";
                return (
                  <TableRow
                    key={vehicle.deviceId ?? vehicle.vehicleNo}
                    className="border-border/60 transition-colors hover:bg-muted/40"
                  >
                    <TableCell className="text-xs font-medium">
                      {vehicle.route ? (
                        <span className="inline-flex items-center gap-1.5">
                          <RouteIcon className="h-3 w-3 text-primary" />
                          {vehicle.route}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Bus className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-mono text-xs font-medium">{vehicle.vehicleNo ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{vehicle.model ?? "—"}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {vehicle.engineNo ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {vehicle.chassisNo ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          isMoving
                            ? "bg-emerald-500/10 text-emerald-700"
                            : vehicle.deviceStatus === "STOPPED"
                            ? "bg-slate-500/10 text-slate-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isMoving ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                          }`}
                        />
                        {vehicle.deviceStatus ?? "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                        {vehicle.vehicleSpeed ?? 0}
                        <span className="text-muted-foreground text-xs font-normal">km/h</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-xs max-w-[180px]">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{resolveLocationLabel(vehicle, placeNames, resolvingKeys)}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <FuelBar value={vehicle.fuelLevelInPer} />
                    </TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">
                      {vehicle.odometer !== undefined && vehicle.odometer !== null
                        ? `${Number(vehicle.odometer).toLocaleString()} km`
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {(loadingVehicles || !vehicles.length) && (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Bus className="h-8 w-8 opacity-30" />
                      <span className="text-sm">
                        {loadingVehicles
                          ? "Loading saved vehicle locations…"
                          : "No saved GPS data. Sync live GPS to get the latest locations."}
                      </span>
                    </div>
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

function StatCard({ icon, label, value, accent }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold tabular-nums">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function FuelBar({ value }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  const pct = Math.max(0, Math.min(100, Number(value)));
  const barColor = pct > 50 ? "bg-emerald-500" : pct > 20 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 w-24">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-medium tabular-nums w-9 text-right">{pct}%</span>
    </div>
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
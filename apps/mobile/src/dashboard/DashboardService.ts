import type { DashboardState } from "./DashboardState.js";

export class DashboardService {

    public create(): DashboardState {

        return {
            online: true,
            version: "2.0.0-alpha.2",
            uptime: Math.floor(process.uptime()),
            health: 100,

            kernelStatus: "running",
            runtimeStatus: "running",
            sessionStatus: "active",
            memoryStatus: "loaded",
            lifecycleStatus: "running",
            configurationStatus: "loaded",

            capabilitiesCount: 0
        };

    }

}

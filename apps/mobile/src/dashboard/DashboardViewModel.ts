import type { DashboardState } from "./DashboardState.js";

export interface DashboardViewModel {

    readonly online: boolean;

    readonly version: string;

    readonly uptime: string;

    readonly health: number;

    readonly kernelStatus: string;

    readonly runtimeStatus: string;

    readonly sessionStatus: string;

    readonly memoryStatus: string;

    readonly lifecycleStatus: string;

    readonly configurationStatus: string;

    readonly capabilitiesCount: number;

}

export function createDashboardViewModel(
    state: DashboardState
): DashboardViewModel {

    return {

        online: state.online,

        version: state.version,

        uptime: `${state.uptime}s`,

        health: state.health,

        kernelStatus: state.kernelStatus,

        runtimeStatus: state.runtimeStatus,

        sessionStatus: state.sessionStatus,

        memoryStatus: state.memoryStatus,

        lifecycleStatus: state.lifecycleStatus,

        configurationStatus: state.configurationStatus,

        capabilitiesCount: state.capabilitiesCount

    };

}

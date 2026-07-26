import { DashboardApi } from "../api/DashboardApi.js";

export class DashboardScreen {

    private readonly api = new DashboardApi();

    public render(): string {

        const dashboard = this.api.status();

        return `
GENESIS 2.0

🟢 ONLINE

Health ............ ${dashboard.health}%

Kernel ............ ${dashboard.kernelStatus}

Runtime ........... ${dashboard.runtimeStatus}

Session ........... ${dashboard.sessionStatus}

Capabilities ...... ${dashboard.capabilitiesCount}

Version ........... ${dashboard.version}

Uptime ............ ${dashboard.uptime}

Bom dia, Senhor Leonardo.

Estou pronto.
`;

    }

}

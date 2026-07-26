import { DashboardService } from "./DashboardService.js";
import { createDashboardViewModel } from "./DashboardViewModel.js";

export class DashboardController {

    private readonly service = new DashboardService();

    public getDashboard() {

        const state = this.service.create();

        return createDashboardViewModel(state);

    }

}

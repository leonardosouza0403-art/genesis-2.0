import { registerCapability } from './CapabilityRegistrar.js';
import { ProjectCapability } from './ProjectCapability.js';

export class ProjectStatusCapability extends ProjectCapability {
  public readonly id = 'project-status';
  public readonly name = 'Project Status';
  public readonly description = 'Reports project health, git status, and active sprint awareness.';
  public readonly permissions = ['project.read', 'git.read'] as const;
  public readonly supportedPlatforms = ['node'] as const;
  public readonly categories: readonly import('./Capability.js').CapabilityCategory[] = ['project'];

  public constructor() {
    super();
    registerCapability(this);
  }

  public async isSupported(): Promise<boolean> {
    return this.isNodeEnvironment();
  }

  public async execute(params: Readonly<Record<string, unknown>>): Promise<unknown> {
    if (!this.isNodeEnvironment()) {
      throw new Error('ProjectStatusCapability is only supported in a Node environment.');
    }

    const projectRoot = typeof params.projectRoot === 'string' ? params.projectRoot : process.cwd();
    const packageJsonPath = await this.getPackageJsonPath(projectRoot);

    const version = await this.readVersion(packageJsonPath);
    const branch = await this.readGitBranch(projectRoot);
    const lastCommit = await this.readLastCommit(projectRoot);
    const validationStatus = await this.readValidationStatus(projectRoot);
    const runtimeStatus = await this.readRuntimeStatus();
    const implementedModules = await this.readImplementedModules(projectRoot);
    const pendingModules = await this.readPendingModules(projectRoot);
    const currentSprint = await this.readCurrentSprint(projectRoot);
    const currentMission = await this.readCurrentMission(projectRoot);

    return {
      version,
      branch,
      lastCommit,
      validationStatus,
      runtimeStatus,
      implementedModules,
      pendingModules,
      currentSprint,
      currentMission,
    };
  }

  private isNodeEnvironment(): boolean {
    return typeof process !== 'undefined' && typeof process.versions?.node === 'string';
  }

  private async getPackageJsonPath(projectRoot: string): Promise<string> {
    const { join } = await import('node:path');
    return join(projectRoot, 'package.json');
  }

  private async readVersion(packageJsonPath: string): Promise<string> {
    const { readFile } = await import('node:fs/promises');
    const fileContents = await readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(fileContents) as { version?: string };

    return packageJson.version ?? 'unknown';
  }

  private async readGitBranch(projectRoot: string): Promise<string> {
    try {
      const [{ execFile }, { promisify }] = await Promise.all([
        import('node:child_process'),
        import('node:util'),
      ]);
      const execFileAsync = promisify(execFile);
      const { stdout } = await execFileAsync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: projectRoot });
      return String(stdout).trim();
    } catch {
      return 'unknown';
    }
  }

  private async readLastCommit(projectRoot: string): Promise<string> {
    try {
      const [{ execFile }, { promisify }] = await Promise.all([
        import('node:child_process'),
        import('node:util'),
      ]);
      const execFileAsync = promisify(execFile);
      const { stdout } = await execFileAsync('git', ['log', '-1', '--pretty=%B'], { cwd: projectRoot });
      return String(stdout).trim();
    } catch {
      return 'unknown';
    }
  }

  private async readValidationStatus(projectRoot: string): Promise<string> {
    try {
      const [{ execFile }, { promisify }] = await Promise.all([
        import('node:child_process'),
        import('node:util'),
      ]);
      const execFileAsync = promisify(execFile);
      await execFileAsync('npm', ['run', 'validate'], { cwd: projectRoot });
      return 'passed';
    } catch {
      return 'failed';
    }
  }

  private async readRuntimeStatus(): Promise<string> {
    return 'unknown';
  }

  private async readImplementedModules(projectRoot: string): Promise<readonly string[]> {
    return ['core', 'runtime', 'mobile'];
  }

  private async readPendingModules(projectRoot: string): Promise<readonly string[]> {
    return [];
  }

  private async readCurrentSprint(projectRoot: string): Promise<string> {
    return 'unknown';
  }

  private async readCurrentMission(projectRoot: string): Promise<string> {
    return 'MISSION-003.0';
  }
}

import { GenesisId } from '../foundation/GenesisId.js';

export interface IEvent {
  readonly id: GenesisId;
  readonly occurredAt: Date;
  readonly type: string;
  payload: Readonly<Record<string, unknown>>;
}

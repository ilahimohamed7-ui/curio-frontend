import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InterestService } from './interest.service';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase.client';

describe('InterestService', () => {
  const mockRpc = vi.fn();
  const mockSupabaseClient = { rpc: mockRpc };
  let service: InterestService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({ error: null });

    TestBed.configureTestingModule({
      providers: [
        { provide: SUPABASE_CLIENT, useValue: mockSupabaseClient }
      ]
    });
    service = TestBed.inject(InterestService);
  });

  it('speichert eindeutige Interessen über die atomare RPC-Funktion', async () => {
    await service.saveInterests([
      'Wissenschaft',
      'Technologie',
      'Wissenschaft'
    ]);

    expect(mockRpc).toHaveBeenCalledWith('save_user_interests', {
      p_categories: ['Wissenschaft', 'Technologie']
    });
  });

  it('übergibt eine leere Auswahl zum Entfernen aller Interessen', async () => {
    await service.saveInterests([]);

    expect(mockRpc).toHaveBeenCalledWith('save_user_interests', {
      p_categories: []
    });
  });

  it('weist ungültige Kategorien vor dem RPC-Aufruf zurück', async () => {
    await expect(
      service.saveInterests(['Sport' as never])
    ).rejects.toThrow();

    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('reicht Fehler der Datenbankfunktion an den Aufrufer weiter', async () => {
    const rpcError = new Error('RPC failed');
    mockRpc.mockResolvedValue({ error: rpcError });

    await expect(
      service.saveInterests(['Wissenschaft'])
    ).rejects.toBe(rpcError);
  });
});

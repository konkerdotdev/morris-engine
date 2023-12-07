import { shellWrapRenderString } from '../engine/shell';
import { renderString } from '../render/text';
import type { D_3, N_3, P_3 } from './index';

export const shellRenderString = shellWrapRenderString<P_3, D_3, N_3>(renderString);

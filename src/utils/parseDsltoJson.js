import {transformer} from '@openfga/syntax-transformer';

export function parseDslToJson(dslText) {
    return transformer.transformDSLToJSONObject(dslText);
}

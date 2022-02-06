import {ClientError} from '../../logic/errors/clientError';
import {ErrorCodes} from '../../logic/errors/errorCodes';

/*
 * A utility method to enforce scopes at the entry point
 */
export class ScopeVerifier {

    public static enforce(scopes: string[], requiredScope: string): void {

        if (!scopes.some((s) => s.indexOf(requiredScope) !== -1)) {

            throw new ClientError(
                403,
                ErrorCodes.insufficientScope,
                'Access token does not have a valid scope for this API endpoint');
        }
    }
}

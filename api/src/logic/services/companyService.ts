import {ApiClaims} from '../entities/apiClaims';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {ClientError} from '../errors/clientError';
import {CompanyRepository} from '../repositories/companyRepository';

/*
 * Our service layer class applies logic before returning data
 */
export class CompanyService {

    private readonly _repository: CompanyRepository;
    private readonly _claims: ApiClaims;

    public constructor(repository: CompanyRepository, claims: ApiClaims) {
        this._repository = repository;
        this._claims = claims;
    }

    /*
     * Return the list of companies
     */
    public async getCompanyList(): Promise<Company[]> {

        // Get all companies
        const companies = await this._repository.getCompanyList();

        // Filter on those the user is authorized to access
        return companies.filter((c) => this._isUserAuthorizedForCompany(c));
    }

    /*
     * Return the transaction details for a company
     */
    public async getCompanyTransactions(id: number): Promise<CompanyTransactions> {

        // Forward to the repository class
        const data = await this._repository.getCompanyTransactions(id);

        // If the user is unauthorized or data was not found then return 404
        if (!data || !this._isUserAuthorizedForCompany(data.company)) {
            throw this._unauthorizedError(id);
        }

        return data;
    }

    /*
     * Apply claims that were read when the access token was first validated
     */
    private _isUserAuthorizedForCompany(company: Company): boolean {
        const found = this._claims.regionsCovered.find((c) => c === company.region);
        return !!found;
    }

    /*
     * Return a 404 error if a company is requested that is outside an allowed range
     */
    private _unauthorizedError(companyId: number): ClientError {
        return new ClientError(
            404,
            'company_not_found',
            `Company ${companyId} was not found for this user`);
    }
}

import {Company} from '../entities/company.js';
import {CompanyTransactions} from '../entities/companyTransactions.js';
import {JsonFileReader} from '../utilities/jsonFileReader.js';

/*
 * A simple repository class
 */
export class CompanyRepository {

    private readonly jsonReader: JsonFileReader;

    public constructor(jsonReader: JsonFileReader) {
        this.jsonReader = jsonReader;
    }

    /*
     * Return the list of companies from a hard coded data file
     */
    public async getCompanyList(): Promise<Company[]> {

        return this.jsonReader.readData<Company[]>('data/companyList.json');
    }

    /*
     * Return transactions for a company given its id
     */
    public async getCompanyTransactions(id: number): Promise<CompanyTransactions | null> {

        // Read companies and find that supplied
        const companyList = await this.jsonReader.readData<Company[]>('data/companyList.json');
        const foundCompany = companyList.find((c) => c.id === id);
        if (foundCompany) {

            // Next read transactions from the database
            const companyTransactions =
                await this.jsonReader.readData<CompanyTransactions[]>('data/companyTransactions.json');

            // Then join the data
            const foundTransactions = companyTransactions.find((ct) => ct.id === id);
            if (foundTransactions) {
                foundTransactions.company = foundCompany;
                return foundTransactions;
            }
        }

        // Indicate no data found
        return null;
    }
}

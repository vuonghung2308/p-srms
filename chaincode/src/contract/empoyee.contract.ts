import { Info } from "fabric-contract-api";
import { BaseContract } from "./contract";

@Info({ title: 'EmployeeContract', description: 'Smart contract for Employee' })
export class EmployeeContract extends BaseContract {
    public constructor() { super('Employee'); }

    // @Transaction(false)
    // public async GetInfo(ctx: Context, token: string, id: string): Promise<string> {
    //     this.currentPayload = jwt.verifyEmployee(token);
    //     const employee = await ledger.getState(ctx, id, "EMPLOYEE");
    //     return JSON.stringify(employee);
    // }
}
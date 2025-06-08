export interface ISimpplrAdminOperations {
    login(username: string, password: string): Promise<void>;
}
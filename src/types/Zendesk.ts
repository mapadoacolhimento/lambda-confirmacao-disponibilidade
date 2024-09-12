export type ZendeskUser = {
  id: bigint;
  name: string;
  email: string;
  user_fields: {
    condition: string;
  };
};

export type UpdateZendeskUser = Partial<Omit<ZendeskUser, "id">> & {
  id: bigint;
};

export type ZendeskTicket = {
  id: bigint;
  requester_id: bigint;
};

export type UpdateZendeskTicket = Partial<Omit<ZendeskTicket, "id">> & {
  id: bigint;
};

export type CreateZendeskTicket = Omit<ZendeskTicket, "id">;

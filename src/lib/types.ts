export type EntryDto = { name: string; message: string };

export type GuestbookResponseBody =
  | {
      success: true;
      message: "Entry created";
      entry: EntryDto;
    }
  | {
      success: false;
      message: "Unauthorized" | "Invalid form data" | "Internal server error";
      errors?: unknown[];
    };

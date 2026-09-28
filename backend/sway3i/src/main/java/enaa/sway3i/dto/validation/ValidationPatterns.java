package enaa.sway3i.dto.validation;

public final class ValidationPatterns {

    // at least 8 characters with at least one letter and one digit
    public static final String PASSWORD = "^(?=.*[A-Za-z])(?=.*\\d).{8,100}$";
    public static final String PASSWORD_MESSAGE = "Password must be at least 8 characters and contain a letter and a digit";

    // empty, or an optional + followed by digits (spaces allowed)
    public static final String PHONE = "^$|^\\+?[0-9 ]{9,20}$";
    public static final String PHONE_MESSAGE = "Phone number is not valid";

    private ValidationPatterns() {
    }
}

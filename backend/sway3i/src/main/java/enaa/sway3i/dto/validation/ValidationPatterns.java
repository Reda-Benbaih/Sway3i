package enaa.sway3i.dto.validation;

public final class ValidationPatterns {

    public static final String PASSWORD = "^(?=.*[A-Za-z])(?=.*\\d).{8,100}$";
    public static final String PASSWORD_MESSAGE = "Password must be at least 8 characters and contain a letter and a digit";

    public static final String PHONE = "^$|^\\+?[0-9 ]{9,20}$";
    public static final String PHONE_MESSAGE = "Phone number is not valid";

    private ValidationPatterns() {
    }
}

package enaa.sway3i.dto.validation;

import jakarta.validation.groups.Default;

// validation group used when creating an account: the password is required,
// while on update it can be left empty to keep the old one
public interface OnCreate extends Default {
}

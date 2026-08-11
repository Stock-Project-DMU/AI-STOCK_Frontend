import type { Profile, ProfileErrors } from "./model";

export function hasProfileChanges(profile: Profile, savedProfile: Profile) {
  return (Object.keys(profile) as (keyof Profile)[]).some((field) => {
    if (field === "password") {
      return Boolean(profile.password) && profile.password !== savedProfile.password;
    }

    return profile[field] !== savedProfile[field];
  });
}

export function validateProfile(profile: Profile, savedProfile: Profile) {
  const errors: ProfileErrors = {};
  const today = new Date();
  const [birthYear, birthMonth, birthDay] = profile.birthday.split("-").map(Number);
  const birthday = new Date(birthYear, birthMonth - 1, birthDay);
  const isValidBirthday =
    /^\d{4}-\d{2}-\d{2}$/.test(profile.birthday) &&
    birthday.getFullYear() === birthYear &&
    birthday.getMonth() === birthMonth - 1 &&
    birthday.getDate() === birthDay;

  if (!/^[A-Za-z0-9_-]{4,20}$/.test(profile.userId.trim())) {
    errors.userId = "아이디는 영문, 숫자, 밑줄, 하이픈을 사용해 4~20자로 입력해 주세요.";
  }

  if (profile.password && profile.password !== savedProfile.password && !/^(?=.*[A-Za-z])(?=.*\d).{8,20}$/.test(profile.password)) {
    errors.password = "비밀번호는 영문과 숫자를 포함해 8~20자로 입력해 주세요.";
  }

  if (!/^[가-힣A-Za-z][가-힣A-Za-z\s]{1,29}$/.test(profile.name.trim())) {
    errors.name = "이름은 한글 또는 영문으로 2~30자 입력해 주세요.";
  }

  if (!isValidBirthday || birthday > today) {
    errors.birthday = "올바른 과거 생년월일을 선택해 주세요.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    errors.email = "올바른 이메일 주소를 입력해 주세요.";
  }

  return errors;
}

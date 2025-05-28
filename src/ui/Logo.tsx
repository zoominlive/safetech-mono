function Logo({expanded = false}: { expanded?: boolean }) {
  return (
    <div className="text-center">
      <img src={expanded ? "/logo.png" : "/safetech.png"} alt="Logo" className="w-[115px] mx-auto" />
    </div>
  );
}

export default Logo;

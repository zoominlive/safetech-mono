function Logo({expanded = false}: { expanded?: boolean }) {
  return (
    <div className="text-center">
      <img src={expanded ? "/Safetech Logo High Resolution No Background.png" : "/Safetech Logo (Salamander Only) (1).png"} alt="Logo" className={!expanded ? "h-[60px] mx-auto" : "w-[115px] mx-auto"} />
    </div>
  );
}

export default Logo;

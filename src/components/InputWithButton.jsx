const InputWithButton = ({ 
    value, 
    onChange, 
    onKeyDown, 
    placeholder, 
    onButtonClick, 
    buttonIcon 
  }) => {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 pr-12"
        />
        <button
          onClick={onButtonClick}
          className="absolute right-0 top-0 h-full px-4 bg-teal-600 text-white rounded-r-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center justify-center"
          type="button"
        >
          {buttonIcon}
        </button>
      </div>
    );
  };
  
  export default InputWithButton;
// Get Random Color
export const getRandomColor = () => {
  const colors = ["#456EBC", "#5337B9", "#DC823C", "#DFC137", "#2A9A92", "#5DA9FF", "#A05EB7", "#E163A6", "#CE305A", "#00C9B9"];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return randomColor;
};

// Get Initials 
export const getInitials = (name: string) => {
  const initials = name.charAt(0).toUpperCase();
  return initials;
};


// Date Formatter | output : January 01, 2001
export const formatDate = (dateString: any) => {
  const [month, day] = dateString?.split(" ");
  return `${month} ${day}`;
};

// Wyswiwyg Editor Toolbar
export const toolbarOptions = {
  options: ["inline", "list", "emoji"],
  inline: {
    options: ["bold", "italic", "underline"],
    bold: {
      icon: "assets/editor/editor-bold.svg",
      className: "toolbar-icon bold-icon",
    },
    italic: {
      icon: "assets/editor/editor-italic.svg",
    },
    underline: {
      icon: "assets/editor/editor-underline.svg",
    },
  },
  list: {
    options: ["unordered", "ordered"],
    unordered: {
      icon: "assets/editor/editor-bullet.svg",
    },
    ordered: {
      icon: "assets/editor/editor-list.svg",
    },
  },
  emoji: {
    icon: "assets/editor/editor-emoji.svg",
  },
};

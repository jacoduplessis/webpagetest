def human_file_size(bytes_):
    """
    Formats the value like a 'human-readable' file size (i.e. 13 KB, 4.1 MB,
    102 bytes, etc.).
    """
    try:
        bytes_ = float(bytes_)
    except (TypeError, ValueError, UnicodeDecodeError):
        return '0 bytes'

    def filesize_number_format(value):
        return round(value, 2)

    KB = 1 << 10
    MB = 1 << 20
    GB = 1 << 30
    TB = 1 << 40
    PB = 1 << 50

    negative = bytes_ < 0
    if negative:
        bytes_ = -bytes_  # Allow formatting of negative numbers.

    if bytes_ < KB:
        value = "{} bytes".format(bytes_)
    elif bytes_ < MB:
        value = "{} KB".format(filesize_number_format(bytes_ / KB))
    elif bytes_ < GB:
        value = "{} MB".format(filesize_number_format(bytes_ / MB))
    elif bytes_ < TB:
        value = "{} GB".format(filesize_number_format(bytes_ / GB))
    elif bytes_ < PB:
        value = "{} TB".format(filesize_number_format(bytes_ / TB))
    else:
        value = "{} PB".format( filesize_number_format(bytes_ / PB))

    return value

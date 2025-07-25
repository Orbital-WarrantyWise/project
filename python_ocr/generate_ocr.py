from paddleocr import PaddleOCR
import math
import requests
import io
from PIL import Image
import numpy as np

def parse_image(image_url: str) -> str:
    # Step 0: Get image from image_url
    response = requests.get(image_url)
    img = np.array(Image.open(io.BytesIO(response.content)))

    # Step 1: Obtain cleaned bounding boxes
    paddleOCR = PaddleOCR()
    rawOCR = paddleOCR.ocr(img)
    cleaned_bbs = []
    for entry in rawOCR:
        # Step 1a: For each bounding box, extract the min/max x/y coordinates and text
        [[x1, y1], [x2, y2], [x3, y3], [x4, y4]], (text, confidence) = entry  # Parse each entry
        # print("Received", x1, y1, x2, y2, x3, y3, x4, y4, text, confidence)
        # Note: Can't do min/max of only 2 points, since the bounding box may not be rectangular (e.g. parallelogram) 
        cleaned_bb = {
            "x_min": min(x1, x2, x3, x4),
            "x_max": max(x1, x2, x3, x4),
            "y_min": min(y1, y2, y3, y4),
            "y_max": max(y1, y2, y3, y4),
            "text": text,
        }

        # Step 1b: Compute the bounding box's character width
        cleaned_bb["char_width"] = (cleaned_bb["x_max"] - cleaned_bb["x_min"]) / len(cleaned_bb["text"])

        cleaned_bbs.append(cleaned_bb)

    # Step 2: Group cleaned bounding boxes into lines
    lines = []
    cleaned_bbs.sort(key = lambda cleaned_bb: (cleaned_bb["y_min"], cleaned_bb["x_min"]))  # Sort by y_min then x_min in ascending order (i.e. top left to top right to bottom left to bottom right)
    avg_char_width = sum(cleaned_bb["char_width"] for cleaned_bb in cleaned_bbs) / len(cleaned_bbs)
    y_tolerance = avg_char_width * 1.0  # Can configure this tolerance value, keep at 1.0 to maintain original structure
    for cleaned_bb in cleaned_bbs:
        new_line = True
        for line in lines:
            for i in range(len(line)):
                if abs(cleaned_bb["y_min"] - line[i]["y_min"]) <= y_tolerance:  # Place cleaned_bb into this line
                    line.append(cleaned_bb)
                    new_line = False
                    break
            if not new_line:
                break
        if new_line:
            lines.append([cleaned_bb])
    
    # Step 3: Reconstruct text by adding whitespaces and fixing left-to-right text ordering
    reconstructed_lines = []
    for line in lines:
        line.sort(key = lambda cleaned_bb: cleaned_bb["x_min"])  # Fix left-to-right text ordering
        cur_x = line[0]["x_min"]
        reconstructed_line = []
        for i in range(len(line)):
            space_cnt = max(1, math.ceil((line[i]["x_min"] - cur_x) / avg_char_width))  # Add whitespaces
            reconstructed_line.append(' ' * space_cnt)  # Number of spaces to add = diff_in_x / avg_char_width
            reconstructed_line.append(line[i]["text"])
            cur_x = line[i]["x_max"]  # Update cur_x
        reconstructed_lines.append(''.join(reconstructed_line))
    return "\n".join(reconstructed_lines)

def main():
    image_url = "https://paddle-model-ecology.bj.bcebos.com/paddlex/imgs/demo_image/general_ocr_002.png"
    ocr_text = parse_image(image_url)
    print(ocr_text)

if __name__ == "__main__":
    main()

/**
 * Interface that represents audio input and output device.
 */
export interface AudioIO {
  /**
   * System device unique id.
   * Is not consistent between sessions due to security restrictions.
   */
  id: string;

  /**
   * User-friendly device label, system device name.
   */
  label: string;
}

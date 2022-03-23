using System.Threading.Tasks;
using ProEventos.Application.Dtos;

namespace ProEventos.Application.Contratos
{
    public interface IEventoService
    {
         Task<EventoDto> AddEventos(int userId, EventoDto Model);
         Task<EventoDto> UpdateEvento(int userId, int eventoId, EventoDto Model);
         Task<bool> DeleteEvento(int userId, int eventoId);

         Task<EventoDto[]> GetAllEventosAsync(int userId, bool includePalestrantes = false);
         Task<EventoDto[]> GetAllEventosByTemaAsync(int userId, string tema, bool includePalestrantes = false);
         Task<EventoDto> GetEventoByIdAsync(int userId, int eventoId, bool includePalestrantes = false);
        
    }
}